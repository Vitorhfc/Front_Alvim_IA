const gulp = require('gulp');
const gzip = require('gulp-gzip');
const azure = require('gulp-azure-storage');

const environments = {
  dev: {
    account: 'sitesdr',
    key: 'n9LFNLOyo5c04VneMyuv4zm32spBisz3cVfdEYhW+Jkld7pIoKx7AvpokB48UvC6W6tfGepMVgRV+AStcGflTg==',
    container: '$web',
    contentEncoding: 'gzip'
  },
  beta: {
    account: 'nome_conta',
    key: 'chave_aqui',
    container: '$web',
    contentEncoding: 'gzip'
  }
};

function createUploadTask(env, taskName) {
  const config = environments[env];

  gulp.task(`gzip-${taskName}-azure`, () => {
    return gulp.src(['./dist/Projeto/browser/**/*.*'])
      .pipe(gzip({
        append: false,
        threshold: false
      }))
      .pipe(azure.upload({
        account: config.account,
        key: config.key,
        container: config.container,
        contentSettings: {
          contentEncoding: config.contentEncoding,
          cacheControl: 'public, max-age=108000'
        }
      }));
  });

  gulp.task(`gzip-${taskName}-index-azure`, () => {
    return gulp.src(['./dist/Projeto/browser/index.html'])
      .pipe(azure.upload({
        account: config.account,
        key: config.key,
        container: config.container,
        contentSettings: {
          cacheControl: 'no-cache, no-store, must-revalidate'
        }
      }));
  });

  gulp.task(`gzip-${taskName}`, gulp.series(
    `gzip-${taskName}-azure`,
    `gzip-${taskName}-index-azure`
  ));
}

createUploadTask('dev', 'dev');
createUploadTask('beta', 'beta');

exports.default = gulp.task('gzip-dev');
