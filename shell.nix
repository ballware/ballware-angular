let
    nixpkgs = fetchTarball "https://github.com/NixOS/nixpkgs/tarball/nixos-22.11";
    pkgs = import nixpkgs { config = {}; overlays = []; };
in

pkgs.mkShell {
    packages = with pkgs; [
        git
        nodejs
    ];

    shellHook = ''
        npx cypress install
    '';
}