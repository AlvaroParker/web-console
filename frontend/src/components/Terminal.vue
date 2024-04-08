<script setup lang="ts">
import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css'
import {FitAddon} from '@xterm/addon-fit'
import { onMounted, reactive } from 'vue';

const props = defineProps<{ url: string }>()

const store = reactive({
  terminalEnded: false,
  endTerminal() {
    this.terminalEnded = true
  }
})

onMounted(() => {
  const term = new Terminal()
  const fitAddon = new FitAddon()

  term.loadAddon(fitAddon)
  term.open(document.getElementById("terminal") as HTMLElement)

  fitAddon.fit()
  
  const {rows,cols} = term

  const ws = new WebSocket(`${props.url}?containerHash=e67d6f97c102&width=${cols}&height=${rows}`)

  ws.addEventListener('open', () => {
    console.log("Web-console socket opened")
    ws.send('\n')
  })

  ws.addEventListener('message', event => {
    let data = window.atob(event.data)
    term.write(data)
  })

    ws.addEventListener('error', (error) => {
      console.error("WebSocket Error: ", error);
    });

    ws.addEventListener('close', (event) => {
      // store.endTerminal()
      // term.dispose()
      console.log("WebSocket closed: ", event);
      // try reconnect
    });

  term.onData((data, _) => {
    ws.send(data)
  })

  console.log(rows, cols)

})


</script>

<template>
  <div class="text-3xl font-bold mb-5 mt-5">Ubuntu 22.04</div>
  <div v-if="!store.terminalEnded" id="terminal" class="h-[75%]"></div>
  <div v-if="store.terminalEnded">Terminal sessions has ended. Reload the website to spawn new linux instance</div>
</template>

<style scoped></style>
