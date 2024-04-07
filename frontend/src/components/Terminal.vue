<script setup lang="ts">
import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css'
import {FitAddon} from '@xterm/addon-fit'
import { onMounted } from 'vue';

const props = defineProps<{ url: string }>()

onMounted(() => {
  const term = new Terminal()
  const fitAddon = new FitAddon()

  const ws = new WebSocket(props.url)

  ws.addEventListener('open', () => {
    term.onData(data => {
      ws.send(data)
    })
  })

  ws.addEventListener('message', event => {
    let data = window.atob(event.data)
    term.write(data)
  })

    ws.addEventListener('error', (error) => {
      console.error("WebSocket Error: ", error);
    });

    ws.addEventListener('close', (event) => {
      console.log("WebSocket closed: ", event);
    });

  term.loadAddon(fitAddon)
  term.open(document.getElementById("terminal") as HTMLElement)

  fitAddon.fit()
  
  const {rows, cols} = term
  console.log(rows, cols)

})


</script>

<template>
  <div id="terminal"></div>
</template>

<style scoped></style>
