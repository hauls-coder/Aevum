using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Services;

namespace backend.Controllers;

[Authorize]
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
        var userId = User.FindFirstValue(
            ClaimTypes.NameIdentifier
        )!;

        return taskService.Get(userId);
    }

    [HttpPost]
    public string Create(TaskItem task)
    {
        var userId = User.FindFirstValue(
            ClaimTypes.NameIdentifier
        )!;

        taskService.Create(task, userId);

        return $"Задача '{task.Title}' успешно создана!";
    }

    [HttpDelete("{id}")]
    public string Delete(int id)
    {
        var userId = User.FindFirstValue(
            ClaimTypes.NameIdentifier
        )!;

        return taskService.Delete(id, userId);
    }

    [HttpPut("{id}")]
    public string Update(int id, TaskItem updatedTask)
    {
        var userId = User.FindFirstValue(
            ClaimTypes.NameIdentifier
        )!;

        return taskService.Update(
            id,
            updatedTask,
            userId
        );
    }

    [HttpPost("{id}/focus")]
    public string SetFocus(int id)
    {
        var userId = User.FindFirstValue(
            ClaimTypes.NameIdentifier
        )!;

        return taskService.SetFocus(id, userId);
    }

    [HttpPost("{id}/unfocus")]
    public string ClearFocus(int id)
    {
        var userId = User.FindFirstValue(
            ClaimTypes.NameIdentifier
        )!;

        return taskService.ClearFocus(id, userId);
    }

    [HttpPost("{taskId}/subtasks")]
    public string AddSubTask(int taskId, SubTask subTask)
    {
        var userId = User.FindFirstValue(
            ClaimTypes.NameIdentifier
        )!;

        return taskService.AddSubTask(taskId, subTask, userId);
    }

    [HttpPut("{taskId}/subtasks/{subTaskId}")]
    public string UpdateSubTask(int taskId, int subTaskId, SubTask subTask)
    {
        var userId = User.FindFirstValue(
            ClaimTypes.NameIdentifier
        )!;

        return taskService.UpdateSubTask(taskId, subTaskId, subTask, userId);
    }

    [HttpDelete("{taskId}/subtasks/{subTaskId}")]
    public string DeleteSubTask(int taskId, int subTaskId)
    {
        var userId = User.FindFirstValue(
            ClaimTypes.NameIdentifier
        )!;

        return taskService.DeleteSubTask(taskId, subTaskId, userId);
    }
}

