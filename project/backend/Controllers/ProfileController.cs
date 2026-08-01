using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[Authorize]
[ApiController]
[Route("api/profile")]
public class ProfileController : ControllerBase
{
    private readonly UserManager<AppUser> userManager;

    public ProfileController(
        UserManager<AppUser> userManager
    )
    {
        this.userManager = userManager;
    }

    [HttpGet]
    public async Task<ActionResult> Get()
    {
        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        return Ok(new
        {
            user.Email,
            user.DisplayName
        });
    }
    [HttpPut]
    public async Task<ActionResult> Update(
        UpdateProfileRequest request
    )
    {
        var displayName = request.DisplayName.Trim();

        if(string.IsNullOrWhiteSpace(displayName))
        {
            return BadRequest("Имя не может быть пустым");
        }

        if (displayName.Length > 50)
        {
            return BadRequest(
                "Имя не может быть длинее 50 символов"
            );
        }

        var user = await userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        user.DisplayName = displayName;

        var result = await userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }

        return NoContent();
    }
}