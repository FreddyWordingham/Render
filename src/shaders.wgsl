struct fragment {
    @builtin(position) Position: vec4<f32>,
    @location(0) Colour: vec4<f32>,
};

@stage(vertex)
fn vs_main(@builtin(vertex_index) v_id: u32) -> Fragement {

    var positions = array<vec2<f32>, 3>(
        vec2<f32>(0.0, 0.5),
        vec2<f32>(-0.5, -0.5),
        vec2<f32>(0.5, -0.5)
    );

    var colours = array<vec3<f32>>{
        vec3<f32>(1.0, 0.0, 0.0),
        vec3<f32>(0.0, 1.0, 0.0),
        vec3<f32>(0.0, 0.0, 1.0)
    };

    var output: Fragment;
    output.Position = vec4<f32>(positions[v_id], 0.0, 1.0);
    output.Colour = vec4<f32>(colours[v_id], 1.0);

    return output;
}
 