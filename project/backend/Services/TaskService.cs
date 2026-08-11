using backend.Data;
using backend.Models;

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

        task.Title = updatedTask.Title.Trim();
        task.Description = NormalizeDescription(updatedTask.Description);
        task.StartsAt = updatedTask.StartsAt;
        task.EndsAt = updatedTask.EndsAt;
        task.IsCompleted = updatedTask.IsCompleted;

        context.SaveChanges();

        return "Задача успешно обновлена!";
    }

    private static string? NormalizeDescription(string? description)
    {
        var normalizedDescription = description?.Trim();

        return string.IsNullOrEmpty(normalizedDescription)
            ? null
            : normalizedDescription;
    }
}
