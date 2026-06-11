<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PackageController extends Controller
{
    public function index()
    {
        $packages = Package::all(); 
        $locations = Location::all();

        $data = $packages->map(function ($package) use ($locations) {
            return [
                'id' => $package->id,
                'package_name' => $package->package_name,
                'tier' => $package->tier, // <--- ADDED TIER
                'license_class' => $package->license_class,
                'base_amount' => $package->amount,
                'hours' => $package->hours,
                'description' => $package->description,
                'included_items' => $package->included_items, 
                'pricing_by_location' => $locations->map(function ($loc) use ($package) {
                    $taxAmount = ($package->amount * $loc->tax_rate) / 100;
                    return [
                        'location_name' => $loc->province_name,
                        'tax_rate' => $loc->tax_rate . '%',
                        'tax_type' => $loc->{'tax-type'},
                        'total_price' => round($package->amount + $taxAmount, 2)
                    ];
                })
            ];
        });

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'package_name'   => 'required|string|max:255',
            'tier'           => 'required|in:Basic,Premium', // <--- ADDED VALIDATION
            'license_class'  => 'required|string|max:50',
            'amount'         => 'required|numeric|min:0',
            'hours'          => 'required|integer|min:1',
            'description'    => 'nullable|string',
            'included_items' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // <--- ADDED 'tier' to the array below
        $data = $request->only(['package_name', 'tier', 'license_class', 'amount', 'hours', 'description']);
        if ($request->has('included_items')) {
            $data['included_items'] = $request->included_items;
        }

        $package = Package::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Package created successfully!',
            'data'    => $package
        ], 201);
    }

    public function show($id)
    {
        $package = Package::find($id);
        if (!$package) {
            return response()->json(['message' => 'Package not found'], 404);
        }
        return response()->json(['success' => true, 'data' => $package]);
    }

    public function update(Request $request, $id)
    {
        $package = Package::find($id);
        if (!$package) {
            return response()->json(['message' => 'Package not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'package_name'   => 'sometimes|string|max:255',
            'tier'           => 'sometimes|in:Basic,Premium', // <--- ADDED VALIDATION
            'license_class'  => 'sometimes|string|max:50',
            'amount'         => 'sometimes|numeric|min:0',
            'hours'          => 'sometimes|integer|min:1',
            'description'    => 'nullable|string',
            'included_items' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // <--- ADDED 'tier' to the array below
        $data = $request->only(['package_name', 'tier', 'license_class', 'amount', 'hours', 'description']);
        if ($request->has('included_items')) {
            $data['included_items'] = $request->included_items;
        }

        $package->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Package updated successfully!',
            'data'    => $package->fresh()
        ]);
    }

    public function destroy($id)
    {
        $package = Package::find($id);
        if (!$package) {
            return response()->json(['message' => 'Package not found'], 404);
        }
        
        $package->delete(); 

        return response()->json([
            'success' => true,
            'message' => 'Package deleted successfully (soft delete).'
        ]);
    }

    public function restore($id)
    {
        $package = Package::withTrashed()->find($id);
        if (!$package) {
            return response()->json(['message' => 'Package not found'], 404);
        }
        $package->restore();
        return response()->json(['success' => true, 'message' => 'Package restored.']);
    }
}