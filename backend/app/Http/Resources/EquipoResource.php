<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EquipoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'codigo' => $this->codigo,
            'nombre' => $this->nombre,
            'estado' => $this->estado,
            'fecha_adquisicion' => is_object($this->fecha_adquisicion) && method_exists($this->fecha_adquisicion, 'format')
                ? $this->fecha_adquisicion->format('Y-m-d')
                : $this->fecha_adquisicion,
            'categoria' => new CategoriaResource($this->whenLoaded('categoria')),
        ];
    }
}