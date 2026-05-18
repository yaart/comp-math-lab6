package yaart.s468198.dto;

import java.util.List;

public record OdeResult(
        String methodName,
        List<OdePoint> points,
        double errorRunge,
        double errorExact
) {}