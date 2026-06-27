using backend.Shared.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Đẩy toàn bộ đống code đăng ký dịch vụ (Postgres, Redis, OpenAPI...) vào 1 dòng duy nhất!
builder.Services.AddApplicationServices(builder.Configuration);

var app = builder.Build();

// Đẩy toàn bộ cấu hình Pipeline (Middleware) vào 1 dòng duy nhất!
app.UseApplicationPipeline();
app.Run();
