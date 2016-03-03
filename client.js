var xhr = new XMLHttpRequest();
xhr.open('GET', 'https://cdn.socket.io/socket.io-1.4.5.js', true);
xhr.responseType = 'blob';
xhr.onload = function() {
    var urlBlob = URL.createObjectURL(this.response);
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = urlBlob;
    head.appendChild(script);
    window.setTimeout(function() {
        var socket = io('http://localhost:4545');
        console.log('witnessme!!!');
        socket.on('file-updated', function(res) {
            console.log(res)
            // handlebars
            if (res.fileType === 'hbs') {
                document.getElementsByClassName(res.selector)[0].outerHTML = res.html;

            // scss
            } else if (res.fileType === 'scss') {
                var col = document.getElementsByTagName('link'),
                    path = res.filePath,
                    fileName = path.split('/').pop().replace('scss','css'),

                    // converting HTMLCollection to array and find the right file
                    file = [].slice.call(col).filter(function(el) { return el.href.indexOf(fileName) !== -1})[0];

                    // update stylesheet href with a new timestamp
                    if (file) file.href = file.href + '&witness=' + Date.now();
            }
        })
    }, 1000);
}
xhr.send(null);