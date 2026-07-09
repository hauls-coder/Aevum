using Microsoft.AspNetCore.Mvc;

namespace backend.Conrollers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public string Get()
    {
        return "Life OS API is running";
    }
}