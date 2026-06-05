% Manual de usuario — PQRSD ciudadano
% Plataforma PublicEnt
% Módulo: pqrsd

# PQRSD ciudadano

## Para quién
**Ciudadano** (radica y consulta) y **Funcionario** (ADMIN/EDITOR, responde).

## Requisitos
Módulo **pqrsd** (núcleo). Depende de **sitio_web**.

## Qué permite
Recibir Peticiones, Quejas, Reclamos, Sugerencias y Denuncias (PQRSD), calcular el término legal en días hábiles (Ley 1755/2015 + Ley Emiliani) y gestionar la respuesta.

## Flujo del ciudadano
1. Ingrese a **/atencion-ciudadano/pqrsd**.
2. Seleccione el tipo (Petición, Queja, Reclamo, Sugerencia, Denuncia).
3. Escriba la solicitud (mínimo 50 caracteres) y, opcionalmente, sus datos y género (información voluntaria).
4. Verifique el captcha y envíe. El sistema entrega un **Número de Radicado**.
5. Consulte el estado en **/atencion-ciudadano/pqrsd/consulta** con ese número.

## Flujo del funcionario
1. Abra **/admin/pqrs**. Verá KPIs (Total PQRS, Pendientes, Vencidas, Resueltas hoy) y filtros por tipo, estado y **Solo vencidas**.
2. Abra un radicado: revise estado (Radicado, En revisión, En trámite, Resuelto, Cerrado) y fecha de vencimiento.
3. Redacte y registre la **respuesta**; el ciudadano es notificado por correo.

## Notas del módulo
- La **fecha de vencimiento** se calcula en **días hábiles con Ley Emiliani**; el semáforo de vencimiento se evalúa contra esa fecha.
- Con el módulo **Ventanilla Única** activo, este flujo se enriquece con IA y asignación (ver su manual).


## Notas generales

- Los **plazos en días hábiles** (términos legales) respetan la **Ley Emiliani**: se excluyen sábados, domingos y festivos colombianos, con traslado de festivos al lunes. El cálculo es central (`dias-habiles.ts`) y consistente entre módulos.
- Donde interviene **IA**, el principio es **la IA sugiere y el funcionario decide**: ninguna acción legal se ejecuta sin confirmación humana.
- Los roles del sistema son **SUPER_ADMIN, ADMIN, EDITOR, USER**. Cada manual indica qué rol realiza cada tarea.
