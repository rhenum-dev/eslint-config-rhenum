const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const configFiles = {
  prettier: ".prettierrc.json",
  eslint: ".eslintrc.json",
  tsconfig: "tsconfig.json",
};

// Packages required for the configurations
const packages = {
  prettier: ["prettier"],
  typescript: [
    "typescript",
    "@typescript-eslint/parser",
    "@typescript-eslint/eslint-plugin",
  ],
  eslint: [
    "eslint",
    "eslint-config-airbnb",
    "eslint-config-airbnb-typescript",
    "eslint-plugin-prettier",
    "eslint-plugin-react",
    "eslint-plugin-jsx-a11y",
    "eslint-config-prettier",
    "eslint-plugin-prettier",
  ],
};

// Function to check if a package is installed
const isPackageInstalled = (packageName) => {
  try {
    execSync(`npm list ${packageName}`, { stdio: "ignore" });
    return true;
  } catch (error) {
    return false;
  }
};

const tailwindInstalled = isPackageInstalled("tailwindcss");

if (tailwindInstalled) {
  console.log("Tailwind detected, adding Prettier Tailwind plugin...");
  packages.prettier.push("prettier-plugin-tailwindcss");
} else {
  console.log("Tailwind not detected, skipping Prettier Tailwind plugin.");
}

// Copy/overwrite config files from repo to the project directory
Object.entries(configFiles).forEach(([key, file]) => {
  const filePath = path.join(process.cwd(), file);
  const repoConfigPath = path.join(__dirname, "configs", file);

  // Copy/overwrite config files
  const configContent = fs.readFileSync(repoConfigPath, "utf8");
  fs.writeFileSync(filePath, configContent, "utf8");
  console.log(`${file} has been copied/overwritten!`);
});

// Install the necessary packages
const packagesToInstall = [
  ...packages.eslint,
  ...packages.prettier,
  ...packages.typescript,
];

try {
  console.log("Installing packages...");
  execSync(`npm install --save-dev ${packagesToInstall.join(" ")}`, {
    stdio: "inherit",
  });
  console.log("Packages installed successfully!");
} catch (error) {
  console.error("Error installing packages:", error);
}

// Update package.json to add a new script
const packageJsonPath = path.join(process.cwd(), "package.json");
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  // Add or update the script
  packageJson.scripts = packageJson.scripts || {};
  packageJson.scripts["custom-lint"] = "eslint . --ext .js,.jsx,.ts,.tsx --fix";
  packageJson.scripts["format"] = "prettier --write .";

  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2),
    "utf8"
  );
  console.log('Added "lint" script to package.json!');
} else {
  console.error("package.json not found in the project directory.");
}
