using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class TaskService
{
    private readonly AppDbContext context;
    
    public TaskService(AppDbContext context)
    {
        this.context = context;
    }
    public List<TaskItem> Get(string userId)
    {
        return context.Tasks
        .Include(task => task.SubTasks)
        .Where(task => task.UserId == userId)
        .ToList();
    }

    public void Create(TaskItem task, string userId)
    {
        task.Title = task.Title.Trim();
        task.Description = NormalizeDescription(task.Description);
        task.UserId = userId;


        context.Tasks.Add(task);
        context.SaveChanges();
    }

    public string Delete(int id, string userId)
    {
        var task = context.Tasks.SingleOrDefault(
            task => task.Id == id && task.UserId == userId
        );

        if (task == null)
        {
            return "Задача не найдена!";
        }

        context.Tasks.Remove(task);
        context.SaveChanges();

        return "Задача успешно удалена!";
    }

    public string Update(
        int id,
        TaskItem updatedTask,
        string userId
    )
    {
        var task = context.Tasks.SingleOrDefault(
            task => task.Id == id && task.UserId == userId
        );

        if (task == null)
        {
            return "Задача не найдена!";
        }

        var wasCompleted = task.IsCompleted;

        task.Title = updatedTask.Title.Trim();
        task.Description = NormalizeDescription(updatedTask.Description);
        task.StartsAt = updatedTask.StartsAt;
        task.EndsAt = updatedTask.EndsAt;
        task.IsCompleted = updatedTask.IsCompleted;
        task.IsRecurring = updatedTask.IsRecurring;
        task.ReminderMinutesBefore = updatedTask.ReminderMinutesBefore;


        // Если повторяющуюся задачу только что завершили — создаём копию на завтра
        if (!wasCompleted && task.IsCompleted && task.IsRecurring)
        {
            CreateNextOccurrence(task, userId);
        }

        context.SaveChanges();

        return "Задача успешно обновлена!";
    }

    private void CreateNextOccurrence(TaskItem completedTask, string userId)
    {
        var nextTask = new TaskItem
        {
            Title = completedTask.Title,
            Description = completedTask.Description,
            StartsAt = completedTask.StartsAt?.AddDays(1),
            EndsAt = completedTask.EndsAt?.AddDays(1),
            IsRecurring = true,
            ReminderMinutesBefore = completedTask.ReminderMinutesBefore,
            IsCompleted = false,
            UserId = userId,
        };

        context.Tasks.Add(nextTask);
    }

    public string SetFocus(int id, string userId)
    {
        var task = context.Tasks.SingleOrDefault(
            task => task.Id == id && task.UserId == userId
        );

        if (task == null)
        {
            return "Задача не найдена!";
        }

        var currentFocusTasks = context.Tasks.Where(
            t => t.UserId == userId && t.IsFocus
        );

        foreach (var focusedTask in currentFocusTasks)
        {
            focusedTask.IsFocus = false;
        }
        
        task.IsFocus = true;

        context.SaveChanges();

        return "Фокус дня установлен!";
    }

    public string ClearFocus(int id, string userId)
    {
        var task = context.Tasks.SingleOrDefault(
            task => task.Id == id && task.UserId == userId
        );

        if (task == null)
        {
            return "Задача не найдена!";
        }

        task.IsFocus = false;

        context.SaveChanges();

        return "Фокус дня снят!";
    }

    public string AddSubTask(int taskId, SubTask subTask, string userId)
    {
        var task = context.Tasks.SingleOrDefault(
            task => task.Id == taskId && task.UserId == userId
        );

        if (task == null)
        {
            return "Задача не найдена!";
        }

        subTask.Title = subTask.Title.Trim();
        subTask.TaskItemId = taskId;

        context.SubTasks.Add(subTask);
        context.SaveChanges();

        return "Подзадача добавлена!";
    }

    public string UpdateSubTask(
        int taskId,
        int subTaskId,
        SubTask updatedSubTask,
        string userId
    )
    {
        var subTask = context.SubTasks
            .Include(s => s.TaskItem)
            .SingleOrDefault(
                s => s.Id == subTaskId
                    && s.TaskItemId == taskId
                    && s.TaskItem!.UserId == userId
            );

        if (subTask == null)
        {
            return "Подзадача не найдена!";
        }

        subTask.Title = updatedSubTask.Title.Trim();
        subTask.IsCompleted = updatedSubTask.IsCompleted;

        context.SaveChanges();

        return "Подзадача обновлена!";
    }

    public string DeleteSubTask(int taskId, int subTaskId, string userId)
    {
        var subTask = context.SubTasks
            .Include(s => s.TaskItem)
            .SingleOrDefault(
                s => s.Id == subTaskId
                    && s.TaskItemId == taskId
                    && s.TaskItem!.UserId == userId
            );

        if (subTask == null)
        {
            return "Подзадача не найдена!";
        }

        context.SubTasks.Remove(subTask);
        context.SaveChanges();

        return "Подзадача удалена!";
    }

    private static string? NormalizeDescription(string? description)
    {
        var normalizedDescription = description?.Trim();

        return string.IsNullOrEmpty(normalizedDescription)
            ? null
            : normalizedDescription;
    }
}
