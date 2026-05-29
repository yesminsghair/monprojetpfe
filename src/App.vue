<template>
  <router-view />
  <!-- Chat IA global -->
  <AiChatWidget />
</template>

<script>
import AiChatWidget from "./components/AiChatWidget.vue";

export default {
  components: {
    AiChatWidget
  }
};
</script>