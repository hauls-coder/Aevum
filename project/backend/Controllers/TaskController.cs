using Microsoft.AspNetCore.Mvc;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/tasks")]
public class TasksController : ControllerBase
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
            Title = "Сделать первую версию Life OS",
            IsCompleted = false
        }
    };
    [HttpGet]
    public List<TaskItem> Get()
    {
        return tasks;

    }

    [HttpPost]
    public string Create(TaskItem task)
    {
        tasks.Add(task);
        return $"Задача '{task.Title}' успешно создана!";
    }

    [HttpDelete("{id}")]
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

    [HttpPut("{id}")]
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
