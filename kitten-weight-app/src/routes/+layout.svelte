<script>
  import '../app.css';
</script>

<svelte:head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Foster Kitten Weight Monitor - Track the growth and health of foster kittens">
</svelte:head>

<!-- Skip to main content link for screen readers and keyboard navigation -->
<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-blue-600 text-white px-6 py-3 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300">
  Skip to main content
</a>

<div id="main-content">
  <slot />
</div>

<style>
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  
  .focus\:not-sr-only:focus {
    position: static;
    width: auto;
    height: auto;
    padding: 0.75rem 1.5rem;
    margin: 0;
    overflow: visible;
    clip: auto;
    white-space: normal;
  }
</style>