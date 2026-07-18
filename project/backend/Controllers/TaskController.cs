using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/tasks")]
public class TasksController : ControllerBase
{
    private readonly TaskService taskService;

    public TasksController(TaskService taskService)
    {
        this.taskService = taskService;
    }

    [HttpGet]
    public List<TaskItem> Get()
    {
        return taskService.Get();
    }

    [HttpPost]
    public string Create(TaskItem task)
    {
        taskService.Create(task);

        return $"Задача '{task.Title}' успешно создана!";
    }

    [HttpDelete("{id}")]
    public string Delete(int id)
    {
        return taskService.Delete(id);
    }

    [HttpPut("{id}")]
    public string Update(int id, TaskItem updatedTask)
    {
        return taskService.Update(id, updatedTask);
    }
}

    