struct Vertex {
    position: vec2<f32>,
    colour: vec3<f32>,
}

struct Fragment {
    @builtin(position) Position: vec4<f32>,
    @location(0) Colour: vec4<f32>,
};

@vertex
fn vs_main(@location(0) vertexPosition: vec2<f32>, @location(1) vertexColour: vec3<f32>) -> Fragment {

    var output: Fragment;
    output.Position = vec4<f32>(vertexPosition, 0.0, 1.0);
    output.Colour = vec4<f32>(vertexColour, 1.0);

    return output;
}
 
@fragment
fn fs_main(@location(0) colour: vec4<f32>) -> @location(0) vec4<f32> {
    return colour;
}
