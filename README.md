> Since the plugin is outdated and I do not work with LaTex anymore I archived this repository. Feel free to fork.

# latex-formatter README

LaTex-Formatter is a simple VSCode tool for the LaTex - Language

![Example](img/format_example.gif)

## Requirements

- Ubuntu or Windows
- latex-formatter requires a [latexindent.pl](https://github.com/cmhughes/latexindent.pl) installation

## Installation guide

### TexDistro - Package manager

For MiKTeX and TeXLive is a package available.

*****

Reference for the following guides: [latexindent.pl - Documentation](https://github.com/cmhughes/latexindent.pl/tree/master/documentation)
### Windows
1. go to [latexindent.pl](https://github.com/cmhughes/latexindent.pl) and download *latexindent.exe*, *defaultSettings.yaml*, *add-to-path.bat* to the directory where you want to have **latexindent**.
2. right click on *add-to-path.bat* and click *Run as administrator*.
3. log out and lock back in
4. open a command prompt type the following and hit enter
    ```bash
    echo %path%
    ``` 
    to check if **latexindent** is now in your **PATH**

### Linux
1. go to [latexindent.pl](https://github.com/cmhughes/latexindent.pl) and download *latexindent.pl*, *defaultSettings.yaml* the directory where you want to have **latexindent**.
2. within your directory create a directory called *path-helper-files* and download *CMakeLists.txt* and *cmake_uninstall.cmake.in* from the folder *path-helper-files* to this directory
3. run the following commands
    ```bash
    sudo apt-get install cmake
    sudo apt-get update && sudo apt-get install build-essential
    mkdir build && cd build
    cmake ../path-helper-files
    sudo make install
    ```
4. run
    ```bash
    which latexindent.pl
    ```
    to check if **latexindent** was correctly installed

## Release Notes
### 1.0.5

filenames with spaces are now supported

### 1.0.4

added mac support

### 1.0.3

Fixed typos

### 1.0.2

Added windows support

### 1.0.1

Updated readme

### 1.0.0

Initial release

## Roadmap

- Style options

