<template>
  <div>
    <AppHeader />
    <div class="page-content">
      <slot/>
    </div>
  </div>
</template>
<style scoped>
.page-content {
  margin-left: 4rem;
  padding: 1rem;
}
</style>
