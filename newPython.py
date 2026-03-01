def pack(*args):
    return list(args)
def unpack(args):
    return args
print(pack(1, 2, 3))
print(unpack([1, 2, 3]))
def pack_unpack(*args):
    return list(args)
print(pack_unpack(1, 2, 3))
def unpack_pack(args):    
    return args
print(unpack_pack([1, 2, 3]))