<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\GuardarEquipoRequest;
use App\Http\Resources\EquipoResource;
use App\Models\Equipo;
use App\Services\EquipoService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class EquipoController extends Controller
{
    public function __construct(private EquipoService $service)
    {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = min((int) $request->input('per_page', 10), 50);
        $equipos = $this->service->listar(
            $request->input('q'),
            $request->input('estado'),
            $perPage
        );

        return EquipoResource::collection($equipos);
    }

    public function show(Equipo $equipo): EquipoResource
    {
        return new EquipoResource($equipo->load('categoria'));
    }

    public function store(GuardarEquipoRequest $request): JsonResponse
    {
        $equipo = $this->service->crear($request->validated());

        return (new EquipoResource($equipo))
            ->response()
            ->setStatusCode(201)
            ->header('Location', route('equipos.show', $equipo));
    }

    public function update(GuardarEquipoRequest $request, Equipo $equipo): EquipoResource
    {
        $actualizado = $this->service->actualizar($equipo, $request->validated());
        return new EquipoResource($actualizado);
    }

    public function destroy(Equipo $equipo): Response
    {
        $this->service->eliminar($equipo);
        return response()->noContent();
    }

    public function prestar(Equipo $equipo): EquipoResource
    {
        $prestado = $this->service->prestar($equipo);
        return new EquipoResource($prestado);
    }
}