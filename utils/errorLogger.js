import fs from 'fs';
import path from 'path';

export const errorLogger = (err) => {
    const stream = fs.createWriteStream(path.join(__dirname, 'error.log'), { flags: 'a' });
    stream.write(new Date().toISOString() + ' :: ' + JSON.stringify(err) + ' :: ' + err.toString() + '\r\n');
    stream.end();
}

export const errorHandler = (err, req, res, next) => {

    errorLogger(err);

    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page (renders a view and sends the rendered HTML string to the client)
    res.status(err.status || 500);

    if (res.status === 404) {
        res.render('error'); //return html error page not found
    } else {
        res.send(err.toString());
    }

}