/* eslint-env node */
/* eslint quotes: [2, "simple"] */

var path = require('path');
var fs = require('fs');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

var libs = {
  'moment': {
    p: 'node_modules/moment/min/moment-with-locales.min.js',
    v: '2.11.2'
  },
  'av.color': {
    p: 'node_modules/av.color/av.color.js',
    v: '0.0.1'
  }
}

var prompts = [
  {
    name: 'projectName',
    message: 'What is your project name? (no spaces)',
    default: 'cartodb-viz'
  },
  {
    name: 'projectDescription',
    message: 'A description for your project?',
    default: 'Planning SXSW'
  },
  {
    name: 'gist',
    message: 'Do you want me to create a gist automatically?',
    type: 'confirm',
    default: false
  },
  {
    name: 'transpile',
    message: 'Transpile CSS (PostCSS) and ES6 (babel) ?',
    type: 'confirm',
    default: false
  },
  {
    name: 'libs',
    message: 'Pick optional libraries (remember that _, $ and Backbone are already bundled with CartoDB.js for now)',
    type: 'checkbox',
    choices: Object.keys(libs)
  },
  {
    name: 'template',
    message: 'Pick a a template to start with',
    type: 'list',
    choices: [
      {
        value: 'simple',
        name: chalk.bold('simple') + ' basic template'
      }, {
        value: 'cartodb-bootstrap-template',
        name: chalk.bold('cartodb-bootstrap-template') + ' A starter template for creating a fullscreen cartodb.js map with bootstrap navbar (@chriswong)'
      }
    ]
  }
];


module.exports = yeoman.Base.extend({

  prompting: function () {

    var done = this.async();

    this.log(yosay(
      'Welcome to the ' + chalk.red('CartoDB') + ' generator!'
    ));

    this.prompt(prompts, function(props) {
      this.props = props;
      done();
    }.bind(this));
  },

  writing: function () {
    this.props.projectName = this.props.projectName.replace(/\s+/g, '');

    this.props.libsPaths = [];
    this.props.libsDeps = [];

    this.props.libs.forEach(function(libName) {
      var lib = libs[libName];
      this.props.libsPaths.push(lib.p);
      this.props.libsDeps.push('"' + libName + '" : "^' + lib.v +'"');
    }.bind(this));

    this.props.mainJs = (this.props.transpile) ? 'zzz-dist.js' : 'index.js';
    this.props.mainCss = (this.props.transpile) ? 'zzz-dist.css' : 'index.css';

    var that = this;
    function copyTpl(src, dest) {
      that.fs.copyTpl(
        that.templatePath(src),
        that.destinationPath(dest),
        that
      );
    }

    copyTpl('package.json','package.json');
    copyTpl('favicon.png','favicon.png');
    copyTpl('tpl.gitignore','.gitignore');

    var templateFiles = fs.readdirSync(path.join(this.templatePath(), 'carto-templates', this.props.template));

    templateFiles.forEach(function(templateFile) {
      copyTpl(path.join('carto-templates', this.props.template, templateFile), templateFile)
    }.bind(this))

  },

  install: function () {
    this.npmInstall('', {}, function () {
      this.spawnCommand('npm', ['run', 'build']).on('close', function (code) {
        this.log('Ready. Run ' + chalk.bold.green('npm run dev') + ' to get started');

        if (this.props.gist === true) {
          // create gist
          // TODO get hash from gistup output to display bl.ocks URL as well !
          this.spawnCommand('npm', ['run','gist']);
        }

      }.bind(this));
    }.bind(this));

  }
});
