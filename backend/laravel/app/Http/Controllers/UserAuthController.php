<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserAuthController extends Controller
{
    public function login(Request $request)
    {
        $loginUserData = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required'
        ]);
        $user = User::where('email', $loginUserData['email'])->first();
        if (!$user || !Hash::check($loginUserData['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid Credentials'
            ], 401);
        }
        $user->token = $user->createToken($user->name . '-AuthToken')->plainTextToken;
        return response()->json($user);
    }
    public function logout()
    {
        if (auth()->check()) {
            auth()->user()->tokens()->delete();
            return response()->json([
                "message" => "logged out"
            ]);
        } else {
            return response()->json([
                "message" => "You are not logged in"
            ], 401);
        }
    }
   public function createUser(Request $request){
    User::create([
        'name'=>$request->name,
        'email'=>$request->email,
        'password'=>$request->password
    ]);
    return  response()->json([
        "message" => "user created successfully"
    ],201);  

   }
    public function test(){
        return response()->json([
            "message" => "message responsed and with token"
        ]);  
    }
}
