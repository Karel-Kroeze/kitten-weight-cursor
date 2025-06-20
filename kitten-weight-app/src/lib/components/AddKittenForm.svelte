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

<section class="bg-white rounded-xl shadow-sm border p-12" role="form" aria-labelledby="add-kitten-heading">
  <h2 id="add-kitten-heading" class="text-2xl font-semibold text-gray-900 mb-12">Add New Kitten</h2>
  
  <form on:submit|preventDefault={handleSubmit} class="space-y-8" novalidate>
    {#if error}
      <div class="text-red-600 bg-red-50 p-6 rounded-lg border border-red-200" role="alert" aria-live="polite">
        <strong>Error:</strong> {error}
      </div>
    {/if}

    <fieldset class="border-0 p-0 m-0">
      <legend class="sr-only">Basic kitten information</legend>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label for="name" class="block text-base font-medium text-gray-700 mb-3">
            Name *
          </label>
          <input
            id="name"
            type="text"
            bind:value={name}
            placeholder="Kitten's name"
            class="w-full px-6 py-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-colors min-h-[44px]"
            required
            aria-describedby="name-help"
            autocomplete="off"
          />
          <div id="name-help" class="sr-only">Enter the kitten's name</div>
        </div>

        <div>
          <label for="color" class="block text-base font-medium text-gray-700 mb-3">
            Color
          </label>
          <input
            id="color"
            type="text"
            bind:value={color}
            placeholder="e.g., Orange tabby, Black, Calico"
            class="w-full px-6 py-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-colors min-h-[44px]"
            autocomplete="off"
          />
        </div>

        <div>
          <label for="sex" class="block text-base font-medium text-gray-700 mb-3">
            Sex
          </label>
          <select
            id="sex"
            bind:value={sex}
            class="w-full px-6 py-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-colors min-h-[44px] bg-white"
          >
            <option value="Unknown">Unknown</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        </div>

        <div>
          <label for="status" class="block text-base font-medium text-gray-700 mb-3">
            Status
          </label>
          <select
            id="status"
            bind:value={status}
            class="w-full px-6 py-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-colors min-h-[44px] bg-white"
          >
            <option value="Active">Active</option>
            <option value="Adopted">Adopted</option>
            <option value="Medical Hold">Medical Hold</option>
            <option value="Deceased">Deceased</option>
          </select>
        </div>

        <div>
          <label for="birth_date" class="block text-base font-medium text-gray-700 mb-3">
            Birth Date
          </label>
          <input
            id="birth_date"
            type="date"
            bind:value={birth_date}
            class="w-full px-6 py-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-colors min-h-[44px]"
          />
        </div>

        <div>
          <label for="rescue_date" class="block text-base font-medium text-gray-700 mb-3">
            Rescue Date
          </label>
          <div class="flex gap-3">
            <input
              id="rescue_date"
              type="date"
              bind:value={rescue_date}
              class="flex-1 px-6 py-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-colors min-h-[44px]"
            />
            <button
              type="button"
              on:click={setRescueDateToday}
              class="px-6 py-4 text-base bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-colors min-h-[44px]"
              aria-label="Set rescue date to today"
            >
              Today
            </button>
          </div>
        </div>
      </div>
    </fieldset>

    <div>
      <label for="notes" class="block text-base font-medium text-gray-700 mb-3">
        Notes
      </label>
      <textarea
        id="notes"
        bind:value={notes}
        placeholder="Any additional notes about the kitten..."
        rows="4"
        class="w-full px-6 py-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-colors resize-none"
      ></textarea>
    </div>

    <div class="flex gap-6 pt-8">
      <button
        type="submit"
        disabled={loading}
        class="flex-1 bg-blue-600 text-white py-4 px-8 text-base font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
        aria-describedby={loading ? "submit-status" : undefined}
      >
        {loading ? 'Adding...' : 'Add Kitten'}
      </button>
      {#if loading}
        <div id="submit-status" class="sr-only">Adding kitten, please wait</div>
      {/if}
      <button
        type="button"
        on:click={handleCancel}
        class="px-8 py-4 text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2 transition-colors min-h-[44px]"
        aria-label="Cancel adding kitten"
      >
        Cancel
      </button>
    </div>
  </form>
</section>