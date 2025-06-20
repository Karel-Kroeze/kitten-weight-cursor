<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { KittenWithLatestWeight } from '$lib/database.js';

  export let kittens: KittenWithLatestWeight[];

  const dispatch = createEventDispatcher();

  let selectedKittenId = '';
  let weight = '';
  let notes = '';
  let loading = false;
  let error = '';

  async function handleSubmit() {
    if (!selectedKittenId || !weight) {
      error = 'Please select a kitten and enter a weight';
      return;
    }

    const weightGrams = parseInt(weight);
    if (isNaN(weightGrams) || weightGrams <= 0) {
      error = 'Please enter a valid weight';
      return;
    }

    try {
      loading = true;
      error = '';

      const response = await fetch('/api/weights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          kitten_id: parseInt(selectedKittenId),
          weight_grams: weightGrams,
          notes: notes.trim() || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add weight');
      }

      // Reset form
      selectedKittenId = '';
      weight = '';
      notes = '';
      
      dispatch('weightAdded');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to add weight';
    } finally {
      loading = false;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-4">
  {#if error}
    <div class="text-red-600 text-sm bg-red-50 p-2 rounded">
      {error}
    </div>
  {/if}

  <div>
    <label for="kitten-select" class="block text-sm font-medium text-gray-700 mb-1">
      Kitten
    </label>
    <select
      id="kitten-select"
      bind:value={selectedKittenId}
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      required
    >
      <option value="">Select a kitten...</option>
      {#each kittens.filter(k => k.status === 'Active') as kitten}
        <option value={kitten.id}>
          {kitten.name}
          {#if kitten.latest_weight}
            (last: {kitten.latest_weight >= 1000 
              ? `${(kitten.latest_weight / 1000).toFixed(1)}kg` 
              : `${kitten.latest_weight}g`})
          {/if}
        </option>
      {/each}
    </select>
  </div>

  <div>
    <label for="weight-input" class="block text-sm font-medium text-gray-700 mb-1">
      Weight (grams)
    </label>
    <input
      id="weight-input"
      type="number"
      bind:value={weight}
      placeholder="e.g., 125"
      min="1"
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      on:keydown={handleKeydown}
      required
    />
  </div>

  <div>
    <label for="notes-input" class="block text-sm font-medium text-gray-700 mb-1">
      Notes (optional)
    </label>
    <textarea
      id="notes-input"
      bind:value={notes}
      placeholder="Optional notes about the measurement..."
      rows="2"
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      on:keydown={handleKeydown}
    ></textarea>
  </div>

  <button
    type="submit"
    disabled={loading}
    class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
  >
    {loading ? 'Adding...' : 'Add Weight'}
  </button>
</form>