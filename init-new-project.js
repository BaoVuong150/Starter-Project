const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');
const { execSync } = require('child_process');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

function generateJwtSecret() {
    return crypto.randomBytes(32).toString('base64');
}

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            if (file !== 'bin' && file !== 'obj' && file !== '.git' && file !== 'node_modules') {
                arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
            }
        } else {
            arrayOfFiles.push(path.join(dirPath, file));
        }
    });

    return arrayOfFiles;
}

async function main() {
    console.log("====================================================");
    console.log("       PROJECT STARTER KIT INITIALIZER (SCRIPTER)    ");
    console.log("====================================================");
    
    // 1. Ask for project name
    let projectName = "";
    while (true) {
        const input = await askQuestion("Enter the new project name (PascalCase, e.g. ECommerceApi): ");
        const namePattern = /^[A-Z][a-zA-Z0-9]*$/;
        if (namePattern.test(input)) {
            projectName = input;
            break;
        }
        console.log("Invalid project name. It must be in PascalCase (e.g. MyNewProject) and start with an uppercase letter.");
    }

    // 2. Ask options
    const secureJwt = (await askQuestion("Automatically generate a secure JWT Secret Key? (y/n, default: y): ")).toLowerCase() !== 'n';
    const clearMigrations = (await askQuestion("Delete existing EF Core database migrations? (y/n, default: y): ")).toLowerCase() !== 'n';
    const resetGit = (await askQuestion("Reset Git repository history? (y/n, default: y): ")).toLowerCase() !== 'n';

    rl.close();

    console.log("\nStarting initialization process...");

    const rootDir = __dirname;
    const backendDir = path.join(rootDir, 'backend');
    const apiDir = path.join(backendDir, 'Api');

    // Step 1: Rename backend.csproj to <projectName>.csproj
    const oldCsproj = path.join(apiDir, 'backend.csproj');
    const newCsproj = path.join(apiDir, `${projectName}.csproj`);
    if (fs.existsSync(oldCsproj)) {
        fs.renameSync(oldCsproj, newCsproj);
        console.log(`- Renamed backend.csproj to ${projectName}.csproj`);
    }

    // Step 2: Update BackendSolution.slnx
    const slnxPath = path.join(backendDir, 'BackendSolution.slnx');
    if (fs.existsSync(slnxPath)) {
        let slnxContent = fs.readFileSync(slnxPath, 'utf8');
        slnxContent = slnxContent.replace("Api/backend.csproj", `Api/${projectName}.csproj`);
        fs.writeFileSync(slnxPath, slnxContent, 'utf8');
        console.log("- Updated BackendSolution.slnx project reference");
    }

    // Step 3: Replace namespace and using statements recursively in backend files
    const allFiles = getAllFiles(backendDir);
    let replacedCount = 0;
    allFiles.forEach(filePath => {
        if (filePath.endsWith('.cs') || filePath.endsWith('.slnx')) {
            let content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('backend')) {
                // Replace whole word 'backend' to preserve capitalization where appropriate (though namespaces are lowercase)
                const updated = content.replace(/\bbackend\b/g, projectName);
                fs.writeFileSync(filePath, updated, 'utf8');
                replacedCount++;
            }
        }
    });
    console.log(`- Replaced namespace references in ${replacedCount} backend files`);

    // Step 4: Update docker-compose.yml (Container names and DB name)
    const dockerComposePath = path.join(rootDir, 'docker-compose.yml');
    if (fs.existsSync(dockerComposePath)) {
        let composeContent = fs.readFileSync(dockerComposePath, 'utf8');
        const lowName = projectName.toLowerCase();
        
        // Update container names
        composeContent = composeContent.replace(/container_name:\s*postgres/g, `container_name: ${lowName}_postgres`);
        composeContent = composeContent.replace(/container_name:\s*redis/g, `container_name: ${lowName}_redis`);
        composeContent = composeContent.replace(/container_name:\s*react_frontend/g, `container_name: ${lowName}_frontend`);
        
        // Update DB name references
        composeContent = composeContent.replace(/POSTGRES_DB:\s*demo_db/g, `POSTGRES_DB: ${lowName}_db`);
        composeContent = composeContent.replace(/pg_isready -U admin -d demo_db/g, `pg_isready -U admin -d ${lowName}_db`);
        
        fs.writeFileSync(dockerComposePath, composeContent, 'utf8');
        console.log("- Updated docker-compose.yml container names and DB name");
    }

    // Step 5: Update appsettings.json and appsettings.Development.json
    const appsettingsPath = path.join(apiDir, 'appsettings.json');
    if (fs.existsSync(appsettingsPath)) {
        let appsettings = JSON.parse(fs.readFileSync(appsettingsPath, 'utf8'));
        const lowName = projectName.toLowerCase();
        
        // Update ConnectionStrings
        if (appsettings.ConnectionStrings && appsettings.ConnectionStrings.DefaultConnection) {
            appsettings.ConnectionStrings.DefaultConnection = appsettings.ConnectionStrings.DefaultConnection.replace(
                /Database=[^;]+/g,
                `Database=${lowName}_db`
            );
        }
        
        // Update JWT Secret
        if (secureJwt && appsettings.JwtSettings) {
            appsettings.JwtSettings.SecretKey = generateJwtSecret();
            console.log("- Generated new secure random JWT Secret Key");
        }
        
        fs.writeFileSync(appsettingsPath, JSON.stringify(appsettings, null, 2), 'utf8');
        console.log("- Updated appsettings.json connection strings and configurations");
    }

    // Step 6: Update frontend name in package.json
    const packageJsonPath = path.join(rootDir, 'frontend', 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        let pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        pkg.name = projectName.toLowerCase();
        fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2), 'utf8');
        console.log("- Updated frontend name in package.json");
    }

    // Step 7: Clear EF Core database migrations
    if (clearMigrations) {
        const migrationsDir = path.join(apiDir, 'Migrations');
        if (fs.existsSync(migrationsDir)) {
            const files = fs.readdirSync(migrationsDir);
            let deletedFiles = 0;
            files.forEach(file => {
                const filePath = path.join(migrationsDir, file);
                if (fs.statSync(filePath).isFile()) {
                    fs.unlinkSync(filePath);
                    deletedFiles++;
                }
            });
            console.log(`- Cleared ${deletedFiles} EF Core migrations`);
        }
    }

    // Step 8: Reset Git repository
    if (resetGit) {
        const gitDir = path.join(rootDir, '.git');
        if (fs.existsSync(gitDir)) {
            try {
                fs.rmSync(gitDir, { recursive: true, force: true });
                console.log("- Removed old Git repository history");
                execSync('git init', { cwd: rootDir });
                console.log("- Initialized fresh Git repository");
            } catch (err) {
                console.log("! Failed to completely reset Git. You may need to run 'rm -rf .git' and 'git init' manually.");
            }
        }
    }

    console.log(`\n=== SUCCESS: ${projectName} has been successfully initialized! ===`);
    console.log("Next steps to start development:");
    console.log("1. Run 'docker compose up -d' to start the fresh Database & Redis.");
    console.log(`2. Run 'dotnet ef migrations add InitialCreate --project backend/Api' to create your database schema.`);
    console.log(`3. Run 'dotnet ef database update --project backend/Api' to apply it.`);
    console.log("4. Start your backend and frontend!");
}

main().catch(err => {
    console.error("An error occurred during initialization:", err);
    rl.close();
});
