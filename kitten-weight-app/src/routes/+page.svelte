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
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <header class="bg-white shadow-sm border-b">
    <div class="max-w-6xl mx-auto px-4 py-6">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900">🐱 Foster Kitten Weight Monitor</h1>
        <button
          on:click={() => showAddKitten = !showAddKitten}
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showAddKitten ? 'Cancel' : 'Add New Kitten'}
        </button>
      </div>
    </div>
  </header>

  <main class="max-w-6xl mx-auto px-4 py-8">
    {#if error}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        {error}
      </div>
    {/if}

    {#if showAddKitten}
      <div class="mb-8">
        <AddKittenForm on:kittenAdded={handleKittenAdded} on:cancel={() => showAddKitten = false} />
      </div>
    {/if}

    {#if loading}
      <div class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading kitten data...</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Kittens Overview -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-sm border p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Kittens Overview</h2>
            
            {#if kittens.length === 0}
              <div class="text-center py-8">
                <p class="text-gray-500">No kittens yet. Add your first kitten to get started!</p>
              </div>
            {:else}
              <div class="space-y-4">
                {#each kittens as kitten}
                  <KittenCard {kitten} on:dataChanged={loadData} />
                {/each}
              </div>
            {/if}
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Quick Weight Entry -->
          {#if kittens.length > 0}
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Weight Entry</h3>
              <WeightEntryWidget {kittens} on:weightAdded={handleWeightAdded} />
            </div>
          {/if}

          <!-- Recent Weight Measurements -->
          <div class="bg-white rounded-lg shadow-sm border p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Measurements</h3>
            {#if recentWeights.length === 0}
              <p class="text-gray-500 text-sm">No measurements yet</p>
            {:else}
              <div class="space-y-3">
                {#each recentWeights as weight}
                  <div class="flex justify-between items-center text-sm">
                    <div>
                      <p class="font-medium text-gray-900">{weight.kitten_name}</p>
                      <p class="text-gray-500">{formatDate(weight.measurement_date)}</p>
                    </div>
                    <span class="font-semibold text-blue-600">
                      {formatWeight(weight.weight_grams)}
                    </span>
                  </div>
                {/each}
              </div>
            {/if}
          </div>

          <!-- Quick Stats -->
          {#if kittens.length > 0}
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Total Kittens:</span>
                  <span class="font-medium">{kittens.length}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Active:</span>
                  <span class="font-medium">{kittens.filter(k => k.status === 'Active').length}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Adopted:</span>
                  <span class="font-medium">{kittens.filter(k => k.status === 'Adopted').length}</span>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </main>
</div>
