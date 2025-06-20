<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { KittenWithLatestWeight } from '$lib/database.js';

  export let kitten: KittenWithLatestWeight;

  const dispatch = createEventDispatcher();

  function formatWeight(grams?: number): string {
    if (!grams) return 'No weight recorded';
    if (grams >= 1000) {
      return `${(grams / 1000).toFixed(1)}kg`;
    }
    return `${grams}g`;
  }

  function formatDate(dateString?: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }

  function getStatusColor(status?: string): string {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-100';
      case 'Adopted': return 'text-blue-600 bg-blue-100';
      case 'Medical Hold': return 'text-yellow-600 bg-yellow-100';
      case 'Deceased': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  function getWeightChangeColor(change?: number): string {
    if (!change) return 'text-gray-600';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  }

  function getWeightChangeIcon(change?: number): string {
    if (!change) return '';
    return change > 0 ? '↗️' : '↘️';
  }

  async function deleteKitten() {
    if (!confirm(`Are you sure you want to delete ${kitten.name}? This will also delete all weight measurements.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/kittens/${kitten.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete kitten');
      }

      dispatch('dataChanged');
    } catch (error) {
      alert('Failed to delete kitten: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  function calculateAge(birthDate?: string): string {
    if (!birthDate) return '';
    
    const birth = new Date(birthDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} old`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks !== 1 ? 's' : ''} old`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months !== 1 ? 's' : ''} old`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years !== 1 ? 's' : ''} old`;
    }
  }
</script>

<div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
  <div class="flex justify-between items-start mb-3">
    <div class="flex-1">
      <div class="flex items-center gap-3 mb-2">
        <h3 class="text-lg font-semibold text-gray-900">{kitten.name}</h3>
        <span class="px-2 py-1 text-xs font-medium rounded-full {getStatusColor(kitten.status)}">
          {kitten.status}
        </span>
        {#if kitten.sex && kitten.sex !== 'Unknown'}
          <span class="text-sm text-gray-500">
            {kitten.sex === 'M' ? '♂️ Male' : '♀️ Female'}
          </span>
        {/if}
      </div>
      
      <div class="text-sm text-gray-600 space-y-1">
        {#if kitten.birth_date}
          <div>🎂 {calculateAge(kitten.birth_date)}</div>
        {/if}
        {#if kitten.color}
          <div>🎨 {kitten.color}</div>
        {/if}
        {#if kitten.rescue_date}
          <div>🏠 Rescued {formatDate(kitten.rescue_date)}</div>
        {/if}
      </div>
    </div>

    <button
      on:click={deleteKitten}
      class="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
      title="Delete kitten"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
      </svg>
    </button>
  </div>

  <div class="bg-gray-50 rounded-lg p-3">
    <div class="flex justify-between items-center mb-2">
      <span class="text-sm font-medium text-gray-700">Latest Weight</span>
      {#if kitten.latest_weight_date}
        <span class="text-xs text-gray-500">{formatDate(kitten.latest_weight_date)}</span>
      {/if}
    </div>
    
    <div class="flex items-center gap-3">
      <span class="text-lg font-bold text-blue-600">
        {formatWeight(kitten.latest_weight)}
      </span>
      
      {#if kitten.weight_change}
        <div class="flex items-center gap-1 text-sm {getWeightChangeColor(kitten.weight_change)}">
          <span>{getWeightChangeIcon(kitten.weight_change)}</span>
          <span>
            {kitten.weight_change > 0 ? '+' : ''}{kitten.weight_change}g
            {#if kitten.weight_change_days}
              in {kitten.weight_change_days} day{kitten.weight_change_days !== 1 ? 's' : ''}
            {/if}
          </span>
        </div>
      {/if}
    </div>
  </div>

  {#if kitten.notes}
    <div class="mt-3 text-sm text-gray-600">
      <span class="font-medium">Notes:</span> {kitten.notes}
    </div>
  {/if}
</div>