<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PackageController extends Controller
{
    // 1. GET ALL (Index) - Logic for location prices
    public function index()
    {
        $packages = Package::all();
        $locations = Location::all();

        $data = $packages->map(function ($package) use ($locations) {
            return [
                'id' => $package->id,
                'package_name' => $package->package_name,
                'license_class' => $package->license_class,
                'base_amount' => $package->amount,
                'hours' => $package->hours,
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

    // 2. CREATE (This was the missing method!)
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'package_name'  => 'required|string|max:255',
            'license_class' => 'required|string|max:50',
            'amount'        => 'required|numeric|min:0',
            'hours'         => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $package = Package::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Universal package created!',
            'data'    => $package
        ], 201);
    }

    // 3. SHOW (For editing)
    public function show($id)
    {
        $package = Package::find($id);
        if (!$package) return response()->json(['message' => 'Package not found'], 404);
        return response()->json(['success' => true, 'data' => $package]);
    }

    // 4. UPDATE
    public function update(Request $request, $id)
    {
        $package = Package::find($id);
        if (!$package) return response()->json(['message' => 'Package not found'], 404);

        $package->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Package updated successfully!',
            'data'    => $package
        ]);
    }

    // 5. DELETE
    public function destroy($id)
    {
        $package = Package::find($id);
        if (!$package) return response()->json(['message' => 'Package not found'], 404);
        
        $package->delete();
        return response()->json(['success' => true, 'message' => 'Package deleted successfully!']);
    }
}