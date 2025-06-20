<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let name = '';
  let birth_date = '';
  let rescue_date = '';
  let color = '';
  let sex = 'Unknown';
  let status = 'Active';
  let notes = '';
  let loading = false;
  let error = '';

  async function handleSubmit() {
    if (!name.trim()) {
      error = 'Name is required';
      return;
    }

    try {
      loading = true;
      error = '';

      const response = await fetch('/api/kittens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim(),
          birth_date: birth_date || null,
          rescue_date: rescue_date || null,
          color: color.trim() || null,
          sex,
          status,
          notes: notes.trim() || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add kitten');
      }

      // Reset form
      name = '';
      birth_date = '';
      rescue_date = '';
      color = '';
      sex = 'Unknown';
      status = 'Active';
      notes = '';
      
      dispatch('kittenAdded');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to add kitten';
    } finally {
      loading = false;
    }
  }

  function handleCancel() {
    dispatch('cancel');
  }

  // Set default rescue date to today
  function setRescueDateToday() {
    rescue_date = new Date().toISOString().split('T')[0];
  }
</script>

<div class="bg-white rounded-lg shadow-sm border p-6">
  <h2 class="text-xl font-semibold text-gray-900 mb-6">Add New Kitten</h2>
  
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    {#if error}
      <div class="text-red-600 text-sm bg-red-50 p-3 rounded">
        {error}
      </div>
    {/if}

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          id="name"
          type="text"
          bind:value={name}
          placeholder="Kitten's name"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label for="color" class="block text-sm font-medium text-gray-700 mb-1">
          Color
        </label>
        <input
          id="color"
          type="text"
          bind:value={color}
          placeholder="e.g., Orange tabby, Black, Calico"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label for="sex" class="block text-sm font-medium text-gray-700 mb-1">
          Sex
        </label>
        <select
          id="sex"
          bind:value={sex}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="Unknown">Unknown</option>
          <option value="M">Male</option>
          <option value="F">Female</option>
        </select>
      </div>

      <div>
        <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          id="status"
          bind:value={status}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="Active">Active</option>
          <option value="Adopted">Adopted</option>
          <option value="Medical Hold">Medical Hold</option>
          <option value="Deceased">Deceased</option>
        </select>
      </div>

      <div>
        <label for="birth_date" class="block text-sm font-medium text-gray-700 mb-1">
          Birth Date
        </label>
        <input
          id="birth_date"
          type="date"
          bind:value={birth_date}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label for="rescue_date" class="block text-sm font-medium text-gray-700 mb-1">
          Rescue Date
        </label>
        <div class="flex gap-2">
          <input
            id="rescue_date"
            type="date"
            bind:value={rescue_date}
            class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            on:click={setRescueDateToday}
            class="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Today
          </button>
        </div>
      </div>
    </div>

    <div>
      <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">
        Notes
      </label>
      <textarea
        id="notes"
        bind:value={notes}
        placeholder="Any additional notes about the kitten..."
        rows="3"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      ></textarea>
    </div>

    <div class="flex gap-3 pt-4">
      <button
        type="submit"
        disabled={loading}
        class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Adding...' : 'Add Kitten'}
      </button>
      <button
        type="button"
        on:click={handleCancel}
        class="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        Cancel
      </button>
    </div>
  </form>
</div>