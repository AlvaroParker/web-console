# WebConsole

This project allows you to interact with a Linux machine running on a remote Docker container directly from the browser. To run the project you'll need to run the Go http server on a Linux machine with a user on the `docker` group.

![Screenshot of containers](./showcase/Containers.png)

![Screenshot of ubuntu on the browser](./showcase/UbuntuBrowser.png)

![Screenshot of Container creation](./showcase/NewContainer.png)

![Screenshot of apt on browser](./showcase/AptBrowser.png)


## Todos:

- Handling code editing
- Generate a container to execute remote code for each supported language
- Response back to the client with the output of the code execution
