<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Car;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class CarController extends Controller
{
    /**
     * Get the car assigned to the authenticated instructor.
     */
    public function assignedCar(Request $request)
    {
        // Get the instructor profile linked to the user.
        $instructor = $request->user()->instructor;

        if (!$instructor || !$instructor->car_id) {
            return response()->json([
                'success' => false,
                'message' => 'No car assigned to this instructor.'
            ], 404);
        }

        // Fetch car details with its location branch.
        $car = Car::with('location')->find($instructor->car_id);

        return response()->json([
            'success' => true,
            'data'    => $car
        ]);
    }

    /**
     * Display a listing of cars.
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'data'    => Car::with('location')->get()
        ]);
    }

    /**
     * Store a newly created car.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'location_id'      => 'required|exists:locations,id',
            'car_name'         => 'required|string|max:255',
            'model'            => 'required|string',
            'number_plate'     => 'required|string|unique:cars',
            'color'            => 'nullable|string',
            'odometer'         => 'nullable|numeric',
            'insurance_number' => 'required|string',
            'insurance_expiry' => 'required|date',
            'rc_number'        => 'required|string',
            'rc_expiry'        => 'required|date',
            'car_document'     => 'nullable|file|mimes:pdf,jpg,png|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $documentPath = null;
        if ($request->hasFile('car_document')) {
            $documentPath = $request->file('car_document')->store('car_documents', 'public');
        }

        $car = Car::create([
            'location_id'      => $request->location_id,
            'car_name'         => $request->car_name,
            'model'            => $request->model,
            'number_plate'     => $request->number_plate,
            'color'            => $request->color,
            'odometer'         => $request->odometer,
            'insurance_number' => $request->insurance_number,
            'insurance_expiry' => $request->insurance_expiry,
            'rc_number'        => $request->rc_number,
            'rc_expiry'        => $request->rc_expiry,
            'car_document'     => $documentPath,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Car registered successfully!',
            'data'    => $car
        ], 201);
    }

    /**
     * Update an existing car.
     */
    public function update(Request $request, $id)
    {
        $car = Car::find($id);

        if (!$car) {
            return response()->json(['success' => false, 'message' => 'Car not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'location_id'      => 'sometimes|exists:locations,id',
            'car_name'         => 'sometimes|string|max:255',
            'model'            => 'sometimes|string',
            'number_plate'     => 'sometimes|string|unique:cars,number_plate,' . $id,
            'color'            => 'nullable|string',
            'odometer'         => 'nullable|numeric',
            'insurance_number' => 'sometimes|string',
            'insurance_expiry' => 'sometimes|date',
            'rc_number'        => 'sometimes|string',
            'rc_expiry'        => 'sometimes|date',
            'car_document'     => 'nullable|file|mimes:pdf,jpg,png|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $updateData = $request->only([
            'location_id', 'car_name', 'model', 'number_plate',
            'color', 'odometer', 'insurance_number',
            'insurance_expiry', 'rc_number', 'rc_expiry'
        ]);

        if ($request->hasFile('car_document')) {
            if ($car->car_document && Storage::disk('public')->exists($car->car_document)) {
                Storage::disk('public')->delete($car->car_document);
            }
            $updateData['car_document'] = $request->file('car_document')->store('car_documents', 'public');
        }

        $car->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Car updated successfully!',
            'data'    => $car->refresh()
        ]);
    }

    /**
     * Delete a car and its files.
     */
    public function destroy($id)
    {
        $car = Car::find($id);

        if (!$car) {
            return response()->json(['success' => false, 'message' => 'Car not found'], 404);
        }

        if ($car->car_document && Storage::disk('public')->exists($car->car_document)) {
            Storage::disk('public')->delete($car->car_document);
        }

        $car->delete();

        return response()->json([
            'success' => true,
            'message' => 'Car deleted successfully'
        ]);
    }
}