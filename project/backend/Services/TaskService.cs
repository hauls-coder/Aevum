using backend.Models;

namespace backend.Services;

public class TaskService
{
    private static List<TaskItem> tasks = new List<TaskItem>
    {
        new TaskItem
        {
            Id = 1,
            Title = "Изучить ASP.NET Core",
            IsCompleted = false
        },
        new TaskItem
        {
            Id = 2,
            Title = "Сделать первую версию Aevum",
            IsCompleted = false
        }
    };

    public List<TaskItem> Get()
    {
        return tasks;
    }

    public void Create(TaskItem task)
    {
        tasks.Add(task);
    }

    public string Delete(int id)
    {
        var task = tasks.Find(x => x.Id == id);

        if (task == null)
        {
            return "Задача не найдена!";
        }

        tasks.Remove(task);
        return "Задача успешно удалена!";
    }

    public string Update(int id, TaskItem updatedTask)
    {
        var task = tasks.Find(x => x.Id == id);

        if (task == null)
        {
            return "Задача не найдена!";
        }

        task.Title = updatedTask.Title;
        task.IsCompleted = updatedTask.IsCompleted;

        return "Задача успешно обновлена!";
    }
}