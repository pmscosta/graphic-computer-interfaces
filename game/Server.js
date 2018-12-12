
class Server {
    constructor(port) {
        this.port = port;
    }
    
    send(requestString, onSuccess, onError,game){
        var requestPort = 8081
        var request = new XMLHttpRequest();
        request.open('GET', 'http://localhost:'+requestPort+'/'+requestString, true);

        request.game = game;
        request.onload = onSuccess;
        request.onerror = onError;

        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.send();
    }
  }
  