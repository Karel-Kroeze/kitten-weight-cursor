import { json } from '@sveltejs/kit';
import { WeightService } from '$lib/kittenService.js';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
  try {
    if (!params.id) {
      return json({ error: 'Weight ID is required' }, { status: 400 });
    }
    
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return json({ error: 'Invalid weight ID' }, { status: 400 });
    }

    const weight = WeightService.getWeightById(id);
    if (!weight) {
      return json({ error: 'Weight measurement not found' }, { status: 404 });
    }

    return json(weight);
  } catch (error) {
    console.error('Error fetching weight:', error);
    return json({ error: 'Failed to fetch weight measurement' }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ params, request }) => {
  try {
    if (!params.id) {
      return json({ error: 'Weight ID is required' }, { status: 400 });
    }
    
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return json({ error: 'Invalid weight ID' }, { status: 400 });
    }

    const weightData = await request.json();

    // Check if weight exists
    const existingWeight = WeightService.getWeightById(id);
    if (!existingWeight) {
      return json({ error: 'Weight measurement not found' }, { status: 404 });
    }

    // Validate weight_grams if provided
    if (weightData.weight_grams !== undefined) {
      const weightGrams = parseInt(weightData.weight_grams);
      if (isNaN(weightGrams) || weightGrams <= 0) {
        return json({ error: 'Weight must be a positive number' }, { status: 400 });
      }
      weightData.weight_grams = weightGrams;
    }

    const success = WeightService.updateWeight(id, {
      weight_grams: weightData.weight_grams,
      measurement_date: weightData.measurement_date,
      notes: weightData.notes
    });

    if (!success) {
      return json({ error: 'Failed to update weight measurement' }, { status: 500 });
    }

    const updatedWeight = WeightService.getWeightById(id);
    return json(updatedWeight);
  } catch (error) {
    console.error('Error updating weight:', error);
    return json({ error: 'Failed to update weight measurement' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ params }) => {
  try {
    if (!params.id) {
      return json({ error: 'Weight ID is required' }, { status: 400 });
    }
    
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return json({ error: 'Invalid weight ID' }, { status: 400 });
    }

    // Check if weight exists
    const existingWeight = WeightService.getWeightById(id);
    if (!existingWeight) {
      return json({ error: 'Weight measurement not found' }, { status: 404 });
    }

    const success = WeightService.deleteWeight(id);
    if (!success) {
      return json({ error: 'Failed to delete weight measurement' }, { status: 500 });
    }

    return json({ message: 'Weight measurement deleted successfully' });
  } catch (error) {
    console.error('Error deleting weight:', error);
    return json({ error: 'Failed to delete weight measurement' }, { status: 500 });
  }
};