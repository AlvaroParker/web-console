package handlers

import "net/http"

func MainHandler(writer http.ResponseWriter, request *http.Request) {
	switch request.Method {
	case http.MethodGet:
		writer.Write([]byte("Hello, World!"))

	default:
		break
	}
}
