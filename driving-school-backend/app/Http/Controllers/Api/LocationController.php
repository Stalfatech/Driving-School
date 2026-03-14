<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LocationController extends Controller
{
    /**
     * List all locations (Public/Auth users can see)
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'data'    => Location::all()
        ]);
    }

    /**
     * Show a single location (Useful for Edit forms)
     */
    public function show($id)
    {
        $location = Location::find($id);
        if (!$location) {
            return response()->json(['success' => false, 'message' => 'Location not found'], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $location
        ]);
    }

    /**
     * Store a new location (Admin Only via Middleware)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'province_name' => 'required|string|max:255|unique:locations,province_name',
            'tax_rate'      => 'required|numeric|min:0|max:100',
            'tax-type'      => 'required|string|max:10', 
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $location = Location::create([
            'province_name' => $request->province_name,
            'tax_rate'      => $request->tax_rate,
            'tax-type'      => $request->input('tax-type'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Location created successfully!',
            'data'    => $location
        ], 201);
    }

    /**
     * Update a location (Admin Only via Middleware)
     */
    public function update(Request $request, $id)
    {
        $location = Location::find($id);
        if (!$location) {
            return response()->json(['success' => false, 'message' => 'Location not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'province_name' => 'sometimes|string|max:255|unique:locations,province_name,' . $id,
            'tax_rate'      => 'sometimes|numeric|min:0|max:100',
            'tax-type'      => 'sometimes|string|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // Use fill() to handle the hyphenated key safely
        $location->fill([
            'province_name' => $request->province_name ?? $location->province_name,
            'tax_rate'      => $request->tax_rate ?? $location->tax_rate,
            'tax-type'      => $request->input('tax-type') ?? $location->{'tax-type'},
        ]);

        $location->save();

        return response()->json([
            'success' => true,
            'message' => 'Location updated successfully!',
            'data'    => $location
        ]);
    }

    /**
     * Delete a location (Admin Only via Middleware)
     */
    // public function destroy($id)
    // {
    //     $location = Location::find($id);
    //     if (!$location) {
    //         return response()->json(['success' => false, 'message' => 'Location not found'], 404);
    //     }

    //     // Integrity Check: Don't delete if cars or packages are linked to this location
    //     if ($location->cars()->exists() || $location->packages()->exists()) {
    //         return response()->json([
    //             'success' => false, 
    //             'message' => 'Cannot delete. There are cars or packages assigned to this location.'
    //         ], 400);
    //     }

    //     $location->delete();

    //     return response()->json([
    //         'success' => true,
    //         'message' => 'Location deleted successfully!'
    //     ]);
    // }

    public function destroy($id)
{
    $location = Location::find($id);
    if (!$location) {
        return response()->json(['success' => false, 'message' => 'Location not found'], 404);
    }

    // REMOVE the packages check here because packages are universal
    // ONLY check for cars or students if they are linked to this specific location
    if ($location->cars()->exists()) {
        return response()->json([
            'success' => false, 
            'message' => 'Cannot delete. There are cars assigned to this location.'
        ], 400);
    }

    $location->delete();

    return response()->json([
        'success' => true,
        'message' => 'Location deleted successfully!'
    ]);
}

}