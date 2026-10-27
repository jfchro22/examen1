<?php

use App\Models\Categoria;
use App\Models\Equipo;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    Sanctum::actingAs($this->user);
    $this->categoria = Categoria::factory()->create();
});

test('it crea un equipo y responde 201 con el encabezado Location', function () {
    $this->withoutExceptionHandling();
    $datos = [
        'codigo' => 'EQ-9001',
        'nombre' => 'Laptop de Prueba',
        'estado' => 'disponible',
        'fecha_adquisicion' => '2026-01-15',
        'costo_interno' => 250.50,
        'categoria_id' => $this->categoria->id,
    ];

    $response = $this->postJson('/api/equipos', $datos);

    $response->assertStatus(201)
             ->assertHeader('Location')
             ->assertJsonPath('data.codigo', 'EQ-9001');
});

test('it rechaza un equipo con datos inválidos y responde 422 con errores por campo', function () {
    $response = $this->postJson('/api/equipos', [
        'codigo' => 'INVALIDO',
        'nombre' => 'AB',
    ]);

    $response->assertStatus(422)
             ->assertJsonValidationErrors(['codigo', 'nombre', 'categoria_id', 'fecha_adquisicion', 'costo_interno']);
});

test('it impide eliminar un equipo prestado y responde 409', function () {
    $equipo = Equipo::factory()->create([
        'categoria_id' => $this->categoria->id,
        'estado' => 'prestado',
    ]);

    $response = $this->deleteJson("/api/equipos/{$equipo->id}");

    $response->assertStatus(409)
             ->assertJson([
                 'mensaje' => 'No se puede eliminar un equipo prestado.',
                 'codigo' => 'REGLA_NEGOCIO',
             ]);
});