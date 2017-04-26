var exec = require('child_process').exec;
exec('mongoimport --db recommenderDB --collection products --file db/products.json', function(error, stdout, stderr) {
    console.log('exec error: ' + error);
    if (error === null) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        exec('mongoimport --db recommenderDB --collection signals --file db/signals.json', function(error, stdout, stderr) {
            console.log('exec error: ' + error);
            if (error === null) {
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
                exec('mongoimport --db recommenderDB --collection scan_history --file db/scan_history.json', function(error, stdout, stderr) {
                    console.log('exec error: ' + error);
                    if (error === null) {
                        console.log('stdout: ' + stdout);
                        console.log('stderr: ' + stderr);
                        exec('mongoimport --db recommenderDB --collection product_view --file db/product_view.json', function(error, stdout, stderr) {
                            console.log('exec error: ' + error);
                            if (error === null) {
                                console.log('stdout: ' + stdout);
                                console.log('stderr: ' + stderr);
                                // TO DO
                            }
                        });

                    }
                });

            }
        });
    }
});
