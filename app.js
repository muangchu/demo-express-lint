var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, _next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');

  console.log(car); // pass

  console.log(user.email);                // ✅ Direct logging of sensitive field
  console.log(req.body.user.ssn);         // ✅ Deep nested field detection
  console.log(`User: ${user.phone}`);     // ✅ Template literal parsing
  console.log(JSON.stringify(req.body));  // ✅ Flags PII field in stringified obj
  console.error(user.password)            // ✅ Password field is matched
  console.log("name: " + user.name)       // ✅ MemberExpression + string concatenation handled via traversal

  console.log(user.email);                        // ✅
  logger.info(`User phone: ${user.phone}`);       // ✅
  logService.error(req.body.user.ssn);            // ✅
  log.debug(JSON.stringify(req.body));            // ✅

  logger.info(req.body);      // ❌
  console.log(res.headers);   // ❌
  logService.debug(req.query) // ❌

});

module.exports = app;
