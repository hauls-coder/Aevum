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
    public List<TaskItem> Get()
    {
        return context.Tasks.ToList();
    }

    public void Create(TaskItem task)
    {
        context.Tasks.Add(task);
        context.SaveChanges();
    }

    public string Delete(int id)
    {
        var task = context.Tasks.Find(id);

        if (task == null)
        {
            return "Задача не найдена!";
        }

        context.Tasks.Remove(task);
        context.SaveChanges();

        return "Задача успешно удалена!";
    }

    public string Update(int id, TaskItem updatedTask)
    {
        var task = context.Tasks.Find(id);

        if (task == null)
        {
            return "Задача не найдена!";
        }

        task.Title = updatedTask.Title;
        task.IsCompleted = updatedTask.IsCompleted;

        context.SaveChanges();

        return "Задача успешно обновлена!";
    }
}