package yaart.s468198.dto;

public record OdeRequest(
        int equationId,
        double x0,
        double y0,
        double xn,
        double h,
        double epsilon
) {}