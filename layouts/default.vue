<script setup lang="ts">
const title = ref(
  "پنل مدیریت مرکز مشاوره"
);
useHead({
  meta: [{ content: title }],
  titleTemplate: (titleChunk) => {
    return titleChunk
      ? `${titleChunk} | پنل مدیریت مرکز مشاوره`
      : "پنل مدیریت مرکز مشاوره";
  },
});
</script>

<template>
  <v-locale-provider>
    <v-app>
      <LayoutFullMain />
      <v-main>
        <v-container fluid class="page-wrapper">
          <div class="maxWidth">
            <NuxtPage />
          </div>
        </v-container>
      </v-main>
    </v-app>
  </v-locale-provider>
</template>
