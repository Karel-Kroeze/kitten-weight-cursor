<script lang="ts">
  import { onMount } from 'svelte';
  import type { KittenWithLatestWeight, WeightMeasurement } from '$lib/database.js';
  import WeightEntryWidget from '$lib/components/WeightEntryWidget.svelte';
  import KittenCard from '$lib/components/KittenCard.svelte';
  import AddKittenForm from '$lib/components/AddKittenForm.svelte';

  let kittens: KittenWithLatestWeight[] = [];
  let recentWeights: Array<WeightMeasurement & { kitten_name: string }> = [];
  let loading = true;
  let error = '';
  let showAddKitten = false;

  async function loadData() {
    try {
      loading = true;
      const [kittensResponse, weightsResponse] = await Promise.all([
        fetch('/api/kittens'),
        fetch('/api/weights?limit=5')
      ]);

      if (!kittensResponse.ok || !weightsResponse.ok) {
        throw new Error('Failed to load data');
      }

      kittens = await kittensResponse.json();
      recentWeights = await weightsResponse.json();
      error = '';
    } catch (err) {
      error = 'Failed to load kitten data';
      console.error(err);
    } finally {
      loading = false;
    }
  }

  function handleWeightAdded() {
    loadData(); // Refresh data when new weight is added
  }

  function handleKittenAdded() {
    showAddKitten = false;
    loadData(); // Refresh data when new kitten is added
  }

  function formatWeight(grams: number): string {
    if (grams >= 1000) {
      return `${(grams / 1000).toFixed(1)}kg`;
    }
    return `${grams}g`;
  }

  function formatDate(dateString?: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-100';
      case 'Adopted': return 'text-blue-600 bg-blue-100';
      case 'Medical Hold': return 'text-yellow-600 bg-yellow-100';
      case 'Deceased': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  onMount(loadData);
</script>

<svelte:head>
  <title>Foster Kitten Weight Monitor</title>
  <meta name="description" content="Monitor and track the weight and health of foster kittens">
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <header class="bg-white shadow-sm border-b">
    <div class="max-w-6xl mx-auto px-8 py-12">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900">🐱 Foster Kitten Weight Monitor</h1>
        <button
          on:click={() => showAddKitten = !showAddKitten}
          class="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2 transition-colors min-h-[44px]"
          aria-expanded={showAddKitten}
          aria-controls="add-kitten-form"
        >
          {showAddKitten ? 'Cancel' : 'Add New Kitten'}
        </button>
      </div>
    </div>
  </header>

  <main id="main-content" class="max-w-6xl mx-auto px-8 py-16" role="main">
    {#if error}
      <div class="bg-red-100 border border-red-400 text-red-700 px-8 py-6 rounded-lg mb-12" role="alert" aria-live="polite">
        <strong>Error:</strong> {error}
      </div>
    {/if}

    {#if showAddKitten}
      <div class="mb-16" id="add-kitten-form">
        <AddKittenForm on:kittenAdded={handleKittenAdded} on:cancel={() => showAddKitten = false} />
      </div>
    {/if}

    {#if loading}
      <div class="text-center py-24">
        <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto" role="status" aria-label="Loading kitten data"></div>
        <p class="mt-8 text-gray-600 text-lg">Loading kitten data...</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <!-- Main Kittens Overview -->
        <section class="lg:col-span-2" aria-labelledby="kittens-overview-heading">
          <div class="bg-white rounded-xl shadow-sm border p-12">
            <h2 id="kittens-overview-heading" class="text-2xl font-semibold text-gray-900 mb-12">Kittens Overview</h2>
            
            {#if kittens.length === 0}
              <div class="text-center py-16">
                <p class="text-gray-500 text-lg">No kittens yet. Add your first kitten to get started!</p>
              </div>
            {:else}
              <div class="space-y-8" role="list" aria-label="List of kittens">
                {#each kittens as kitten}
                  <div role="listitem">
                    <KittenCard {kitten} on:dataChanged={loadData} />
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </section>

        <!-- Sidebar -->
        <aside class="space-y-12" aria-label="Quick actions and statistics">
          <!-- Quick Weight Entry -->
          {#if kittens.length > 0}
            <section class="bg-white rounded-xl shadow-sm border p-10" aria-labelledby="quick-weight-heading">
              <h3 id="quick-weight-heading" class="text-xl font-semibold text-gray-900 mb-8">Quick Weight Entry</h3>
              <WeightEntryWidget {kittens} on:weightAdded={handleWeightAdded} />
            </section>
          {/if}

          <!-- Recent Weight Measurements -->
          <section class="bg-white rounded-xl shadow-sm border p-10" aria-labelledby="recent-measurements-heading">
            <h3 id="recent-measurements-heading" class="text-xl font-semibold text-gray-900 mb-8">Recent Measurements</h3>
            {#if recentWeights.length === 0}
              <p class="text-gray-500">No measurements yet</p>
            {:else}
              <div class="space-y-6" role="list" aria-label="Recent weight measurements">
                {#each recentWeights as weight}
                  <div class="flex justify-between items-center border-b border-gray-100 pb-4 last:border-b-0 last:pb-0" role="listitem">
                    <div>
                      <p class="font-medium text-gray-900 mb-1">{weight.kitten_name}</p>
                      <p class="text-gray-500 text-sm">{formatDate(weight.measurement_date)}</p>
                    </div>
                    <span class="font-semibold text-blue-600 text-lg">
                      {formatWeight(weight.weight_grams)}
                    </span>
                  </div>
                {/each}
              </div>
            {/if}
          </section>

          <!-- Quick Stats -->
          {#if kittens.length > 0}
            <section class="bg-white rounded-xl shadow-sm border p-10" aria-labelledby="quick-stats-heading">
              <h3 id="quick-stats-heading" class="text-xl font-semibold text-gray-900 mb-8">Quick Stats</h3>
              <div class="space-y-4">
                <div class="flex justify-between items-center py-2">
                  <span class="text-gray-600">Total Kittens:</span>
                  <span class="font-medium text-lg">{kittens.length}</span>
                </div>
                <div class="flex justify-between items-center py-2">
                  <span class="text-gray-600">Active:</span>
                  <span class="font-medium text-lg">{kittens.filter(k => k.status === 'Active').length}</span>
                </div>
                <div class="flex justify-between items-center py-2">
                  <span class="text-gray-600">Adopted:</span>
                  <span class="font-medium text-lg">{kittens.filter(k => k.status === 'Adopted').length}</span>
                </div>
              </div>
            </section>
          {/if}
        </aside>
      </div>
    {/if}
  </main>
</div>
