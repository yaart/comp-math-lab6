package yaart.s468198.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import yaart.s468198.dto.OdeRequest;
import yaart.s468198.model.DifferentialEquation;
import yaart.s468198.service.OdeSolverService;

import java.util.List;

@RestController
@RequestMapping("/api/ode")
@RequiredArgsConstructor
public class OdeController {

    private final OdeSolverService odeSolverService;

    @GetMapping("/equations")
    public List<DifferentialEquation> getEquations() {
        return odeSolverService.getEquations();
    }

    @PostMapping("/solve")
    public ResponseEntity<?> solve(@RequestBody OdeRequest request) {
        if (request.xn() <= request.x0()) {
            return ResponseEntity.badRequest().body("Начальная точка x0 не должна быть >= конечной xn");
        }
        if (request.h() <= 0) {
            return ResponseEntity.badRequest().body("Шаг h должен быть > 0");
        }

        if (request.xn() < request.x0() + 3 * request.h()) {
            return ResponseEntity.badRequest().body("Интервал (xn - x0) должен содержать минимум 3 шага h для корректного старта метода Милна");
        }

        try {
            return ResponseEntity.ok(odeSolverService.solve(request));
        } catch (ArithmeticException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Системная ошибка");
        }
    }
}