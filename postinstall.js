const inquirer = require('inquirer')
const fs = require('fs')
const path = require('path')

async function setupConfigurations() {
  const choices = await inquirer.prompt([
    {
      type: 'list',
      name: 'method',
      message: 'How would you like to set up your configurations?',
      choices: [
        { name: 'Extend from the library', value: 'extend' },
        { name: 'Overwrite local files', value: 'overwrite' },
      ],
    },
  ])

  if (choices.method === 'extend') {
    console.log('Extending configurations...')

    const eslintContent = `module.exports = { extends: ['@company/configs/.eslintrc.json'] };`
    const prettierContent = `module.exports = require('@company/configs/.prettierrc.json');`
    const tsconfigContent = JSON.stringify(
      {
        extends: '@company/configs/tsconfig.json',
      },
      null,
      2
    )

    fs.writeFileSync(path.join(process.cwd(), '.eslintrc.json'), eslintContent)
    fs.writeFileSync(path.join(process.cwd(), '.prettierrc.json'), prettierContent)
    fs.writeFileSync(path.join(process.cwd(), 'tsconfig.json'), tsconfigContent)

    console.log('Configurations have been set to extend from the library.')
  } else if (choices.method === 'overwrite') {
    console.log('Overwriting local configuration files...')

    const filesToCopy = [
      { src: path.join(__dirname, '.eslintrc.json'), dest: path.join(process.cwd(), '.eslintrc.json') },
      { src: path.join(__dirname, '.prettierrc.json'), dest: path.join(process.cwd(), '.prettierrc.json') },
      { src: path.join(__dirname, 'tsconfig.json'), dest: path.join(process.cwd(), 'tsconfig.json') },
    ]

    filesToCopy.forEach((file) => {
      fs.copyFileSync(file.src, file.dest)
      console.log(`${path.basename(file.src)} has been copied to ${file.dest}`)
    })

    console.log('Local configuration files have been overwritten.')
  }
}

setupConfigurations()
