const inquirer = require("inquirer");
const fs = require("fs"),
  convertFactory = require('electron-html-to');
const util = require("util");
const axios = require("axios");
const generateHTML = require("./generateHTML");
const Logger = require("./logger");
const log = new Logger();


const answersarry = [];

const writeFileAsync = util.promisify(fs.writeFile);

function promptUser() {
  return inquirer.prompt([
    {
      type: "input",
      name: "username",
      message: "What is your github username? (or try username: ceckenrode for a demo. ). Enter here: "
    },
    {
      type: "list",
      name: "color",
      message: "What is your favourite color ?",
      choices: ['green', 'blue','pink','red'],
    },
  ]);
}


async function init() {
  log.yellow("Welcome to my Developer Profile Generator !!")
  log.yellow("let's do it !!")
  try {

    const answers = promptUser();

    answers.then(function ({ username, color }) {
      const queryUrl = `https://api.github.com/users/${username}`;

      axios.get(queryUrl).then(res => {
        var name = res.data.name;
        var avatarUrl = res.data.avatar_url;
        var location = res.data.location;
        var company = res.data.company;
        var githubUrl = res.data.html_url;
        var public_repos = res.data.public_repos;
        var followers = res.data.followers;
        var blog = res.data.blog;
        var following = res.data.following;
        var name = res.data.name;
        var bio = res.data.bio;

        answersarry.push({
          'name': name, 'avatarUrl': avatarUrl, 'location': location, 'company': company,
          'githubUrl': githubUrl, 'public_repos': public_repos,
          'followers': followers,
          'blog': blog,
          'following': following,
          'color': color,
          'bio': bio
        })

        var html = generateHTML(answersarry);
        var conversion = convertFactory({
          converterPath: convertFactory.converters.PDF
        });

        conversion({ html }, function (err, result) {
          if (err) {
            return console.error(err);
          }
          
          result.stream.pipe(fs.createWriteStream(`./${name}-resume.pdf`));
          conversion.kill(); // necessary if you use the electron-server strategy, see bellow for details
          log.green(`Operation is successfully completed, Your PDF resume is saved! Good luck!!!!!!!!`);
          log.white("------------------------------End--------------------------------------");
        });
      })
    });
    
  }
  catch (err) {
    console.log(err);
  }

}

init();
