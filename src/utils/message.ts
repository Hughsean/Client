import { ref } from 'vue';

type Msg = { id: number; text: string; type: 'info' | 'error' };

let idCounter = 1;
const messages = ref<Msg[]>([]);

function push(text: string, type: Msg['type'] = 'info', timeout = 3000) {
  const id = idCounter++;
  messages.value.push({ id, text, type });
  setTimeout(() => {
    const idx = messages.value.findIndex(m => m.id === id);
    if (idx >= 0) messages.value.splice(idx, 1);
  }, timeout);
}

export function messageInfo(text: string, timeout?: number) { push(text, 'info', timeout); }
export function messageError(text: string, timeout?: number) { push(text, 'error', timeout); }
export { messages };

export default { info: messageInfo, error: messageError };
