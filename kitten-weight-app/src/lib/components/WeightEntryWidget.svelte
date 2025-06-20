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

<form on:submit|preventDefault={handleSubmit} class="space-y-8" novalidate role="form" aria-labelledby="weight-entry-title">
  <div class="sr-only" id="weight-entry-title">Quick weight entry form</div>
  
  {#if error}
    <div class="text-red-600 bg-red-50 p-6 rounded-lg border border-red-200" role="alert" aria-live="polite">
      <strong>Error:</strong> {error}
    </div>
  {/if}

  <fieldset class="border-0 p-0 m-0">
    <legend class="sr-only">Weight entry details</legend>
    
    <div>
      <label for="kitten-select" class="block text-base font-medium text-gray-700 mb-3">
        Kitten
      </label>
      <select
        id="kitten-select"
        bind:value={selectedKittenId}
        class="w-full px-6 py-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-colors min-h-[44px] bg-white"
        required
        aria-describedby="kitten-help"
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
      <div id="kitten-help" class="sr-only">Select which kitten to record weight for</div>
    </div>

    <div>
      <label for="weight-input" class="block text-base font-medium text-gray-700 mb-3">
        Weight (grams)
      </label>
      <input
        id="weight-input"
        type="number"
        bind:value={weight}
        placeholder="e.g., 125"
        min="1"
        step="1"
        class="w-full px-6 py-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-colors min-h-[44px]"
        on:keydown={handleKeydown}
        required
        aria-describedby="weight-help"
      />
      <div id="weight-help" class="mt-2 text-sm text-gray-600">Enter the weight in grams (e.g., 125 for 125 grams)</div>
    </div>

    <div>
      <label for="notes-input" class="block text-base font-medium text-gray-700 mb-3">
        Notes (optional)
      </label>
      <textarea
        id="notes-input"
        bind:value={notes}
        placeholder="Optional notes about the measurement..."
        rows="3"
        class="w-full px-6 py-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-colors resize-none"
        on:keydown={handleKeydown}
        aria-describedby="notes-help"
      ></textarea>
      <div id="notes-help" class="sr-only">Optional field for additional notes about this weight measurement</div>
    </div>
  </fieldset>

  <button
    type="submit"
    disabled={loading}
    class="w-full bg-blue-600 text-white py-4 px-6 text-base font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
    aria-describedby={loading ? "submit-status" : undefined}
  >
    {loading ? 'Adding...' : 'Add Weight'}
  </button>
  
  {#if loading}
    <div id="submit-status" class="sr-only">Adding weight measurement, please wait</div>
  {/if}
</form>